from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.services.auth_service import require_admin
from app.database.connection import SessionLocal
from app.models.device import Device
import nmap
import socket
import json

router = APIRouter(prefix="/network", tags=["Network"])

NMAP_PATH = (
    "nmap",
    r"C:\Program Files (x86)\Nmap\nmap.exe",
    r"C:\Program Files\Nmap\nmap.exe",
)


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    finally:
        s.close()


def get_network_range():
    local_ip = get_local_ip()
    parts = local_ip.split(".")
    return f"{parts[0]}.{parts[1]}.{parts[2]}.0/24"


def detect_device_type(vendor: str, hostname: str, open_ports: list) -> str:
    v = vendor.lower()
    h = hostname.lower()

    if any(p in open_ports for p in [80, 443, 8080, 8443]):
        if "router" in h or "gateway" in h or "fritz" in v or "tp-link" in v or "netgear" in v or "asus" in v or "linksys" in v:
            return "Router"
    if "apple" in v:
        if 62078 in open_ports:
            return "iPhone"
        return "Apple Device"
    if "samsung" in v:
        return "Samsung Device"
    if "android" in h:
        return "Android Phone"
    if "raspberry" in v:
        return "Raspberry Pi"
    if "cisco" in v:
        return "Cisco Network Device"
    if "hp" in v or "hewlett" in v:
        if 9100 in open_ports:
            return "HP Printer"
        return "HP Device"
    if "canon" in v or "epson" in v or "brother" in v or "xerox" in v:
        return "Printer"
    if "dell" in v:
        return "Dell PC/Laptop"
    if "lenovo" in v:
        return "Lenovo PC/Laptop"
    if "intel" in v or "realtek" in v:
        return "PC/Laptop"
    if "vmware" in v or "virtual" in v:
        return "Virtual Machine"
    if 22 in open_ports:
        return "Linux Server"
    if 3389 in open_ports:
        return "Windows PC"
    if 9100 in open_ports:
        return "Printer"
    if 80 in open_ports or 443 in open_ports:
        return "Server/Router"
    return "Unknown Device"


def get_device_icon(device_type: str) -> str:
    icons = {
        "Router": "router",
        "iPhone": "phone",
        "Apple Device": "laptop",
        "Samsung Device": "phone",
        "Android Phone": "phone",
        "Raspberry Pi": "server",
        "Cisco Network Device": "router",
        "HP Printer": "printer",
        "Printer": "printer",
        "HP Device": "laptop",
        "Dell PC/Laptop": "laptop",
        "Lenovo PC/Laptop": "laptop",
        "PC/Laptop": "laptop",
        "Virtual Machine": "server",
        "Linux Server": "server",
        "Windows PC": "laptop",
        "Server/Router": "server",
        "Unknown Device": "unknown",
    }
    return icons.get(device_type, "unknown")


@router.get("/scan")
def scan_network(current_user=Depends(require_admin)):
    try:
        nm = nmap.PortScanner(nmap_search_path=NMAP_PATH)
        network_range = get_network_range()

        # Scan with OS detection and common ports
        nm.scan(
            hosts=network_range,
            arguments="-sn -T4 --host-timeout 10s"
        )

        # Get existing devices from inventory
        db = SessionLocal()
        existing_ips = {d.ip_address for d in db.query(Device).all()}
        existing_macs = {d.mac_address.upper() for d in db.query(Device).all() if d.mac_address}
        db.close()

        devices = []
        for host in nm.all_hosts():
            hostname = nm[host].hostname() or "Unknown"
            status = nm[host].state()
            mac = nm[host].get("addresses", {}).get("mac", "")
            vendor = ""

            if mac and nm[host].get("vendor"):
                vendor = list(nm[host]["vendor"].values())[0]

            # Quick port scan for type detection
            open_ports = []
            try:
                nm2 = nmap.PortScanner(nmap_search_path=NMAP_PATH)
                nm2.scan(hosts=host, arguments="-p 22,80,443,3389,9100,62078,8080 --host-timeout 3s -T4")
                if host in nm2.all_hosts():
                    tcp = nm2[host].get("tcp", {})
                    open_ports = [p for p, info in tcp.items() if info["state"] == "open"]
            except Exception:
                pass

            device_type = detect_device_type(vendor, hostname, open_ports)
            icon = get_device_icon(device_type)
            in_inventory = host in existing_ips or mac.upper() in existing_macs

            devices.append({
                "ip": host,
                "hostname": hostname,
                "status": status,
                "mac": mac,
                "vendor": vendor,
                "device_type": device_type,
                "icon": icon,
                "open_ports": open_ports,
                "in_inventory": in_inventory,
            })

        # Sort: not in inventory first, then by IP
        devices.sort(key=lambda x: (x["in_inventory"], x["ip"]))

        return {
            "network": network_range,
            "local_ip": get_local_ip(),
            "total": len(devices),
            "in_inventory": sum(1 for d in devices if d["in_inventory"]),
            "new_devices": sum(1 for d in devices if not d["in_inventory"]),
            "devices": devices
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-ip")
def get_my_ip(current_user=Depends(require_admin)):
    return {
        "ip": get_local_ip(),
        "network": get_network_range()
    }