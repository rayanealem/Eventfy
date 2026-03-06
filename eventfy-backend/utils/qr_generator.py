"""QR Code generation helper."""

import qrcode
import io
import base64


def generate_qr_data_url(data: str) -> str:
    """Generate a QR code as a base64-encoded data URL."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64 = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{b64}"
