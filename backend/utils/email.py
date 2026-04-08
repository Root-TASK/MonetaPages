import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import Optional, List

def send_moneta_email(
    smtp_config: dict,
    to_email: str,
    subject: str,
    content: str,
    attachment_data: Optional[bytes] = None,
    attachment_filename: Optional[str] = None
):
    """
    Utility to send emails using SMTP configuration stored in settings.
    """
    msg = MIMEMultipart()
    msg['From'] = smtp_config.get('smtp_from_email')
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(content, 'html'))

    if attachment_data and attachment_filename:
        part = MIMEApplication(attachment_data)
        part.add_header('Content-Disposition', 'attachment', filename=attachment_filename)
        msg.attach(part)

    try:
        with smtplib.SMTP(smtp_config['smtp_server'], int(smtp_config['smtp_port'])) as server:
            server.starttls()
            server.login(smtp_config['smtp_user'], smtp_config['smtp_password'])
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        raise e
