from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.device import Device
from app.models.alert import Alert
from app.models.maintenance import Maintenance
from app.services.auth_service import require_admin
import io
import csv
from datetime import date

router = APIRouter(prefix="/export", tags=["Export"])


def make_csv(headers, rows):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    output.seek(0)
    return output


@router.get("/devices/csv")
def export_devices_csv(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    devices = db.query(Device).all()
    headers = ["ID", "Name", "Type", "Brand", "Serial Number", "IP Address",
               "MAC Address", "Location", "Status", "Purchase Date", "Warranty Expiry"]
    rows = [
        [d.id, d.name, d.type, d.brand, d.serial_number, d.ip_address,
         d.mac_address, d.location, d.status, d.purchase_date, d.warranty_expiry]
        for d in devices
    ]
    output = make_csv(headers, rows)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=devices.csv"}
    )


@router.get("/alerts/csv")
def export_alerts_csv(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    alerts = db.query(Alert).order_by(Alert.created_at.desc()).all()
    headers = ["ID", "Device ID", "Message", "Status", "Created At"]
    rows = [
        [a.id, a.device_id, a.message, a.status, a.created_at]
        for a in alerts
    ]
    output = make_csv(headers, rows)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=alerts.csv"}
    )


@router.get("/maintenance/csv")
def export_maintenance_csv(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    records = db.query(Maintenance).order_by(Maintenance.created_at.desc()).all()
    headers = ["ID", "Device ID", "Issue", "Status", "Notes", "Reported By", "Maintenance Date", "Created At"]
    rows = [
        [r.id, r.device_id, r.issue, r.status, r.notes, r.reported_by, r.maintenance_date, r.created_at]
        for r in records
    ]
    output = make_csv(headers, rows)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=maintenance.csv"}
    )


@router.get("/warranty/csv")
def export_warranty_csv(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    today = date.today()
    devices = db.query(Device).order_by(Device.warranty_expiry).all()
    headers = ["ID", "Name", "Type", "Brand", "Warranty Expiry", "Days Left", "Status"]
    rows = [
        [
            d.id, d.name, d.type, d.brand, d.warranty_expiry,
            (d.warranty_expiry - today).days if d.warranty_expiry else "N/A",
            "Expired" if d.warranty_expiry and d.warranty_expiry < today else "Active"
        ]
        for d in devices
    ]
    output = make_csv(headers, rows)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=warranty_report.csv"}
    )