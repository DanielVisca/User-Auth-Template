"""Email sending. Real SMTP when SMTP_* env vars are set; otherwise log to console (stub)."""
import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def _send_smtp_sync(to: str, subject: str, body: str) -> None:
    """Blocking SMTP send. Run in thread to not block async."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.mail_from
    msg["To"] = to
    msg.attach(MIMEText(body, "plain", "utf-8"))
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
        if settings.smtp_user and settings.smtp_password:
            smtp.starttls()
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.sendmail(settings.mail_from, to, msg.as_string())


async def send_email(to: str, subject: str, body: str) -> None:
    """Send email. If SMTP_* configured, send for real; else log to console (stub)."""
    if settings.smtp_host and settings.smtp_user and settings.smtp_password:
        try:
            await asyncio.to_thread(_send_smtp_sync, to, subject, body)
            logger.info("Email sent to %s: %s", to, subject)
        except Exception as e:
            logger.exception("Failed to send email to %s: %s", to, e)
        return
    logger.info("[EMAIL STUB] To: %s | Subject: %s\n%s", to, subject, body)
