import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from jinja2 import Template
import asyncio

class EmailService:
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
        self.from_email = settings.from_email
    
    async def send_ticket_assignment_email(self, moderator_email: str, ticket_data: dict):
        """Send email notification to assigned moderator"""
        if not all([self.smtp_user, self.smtp_password, moderator_email]):
            print("Email configuration incomplete, skipping email notification")
            return
            
        template = Template("""
        <html>
        <body>
            <h2>New Ticket Assigned</h2>
            <p>You have been assigned a new support ticket:</p>
            
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0;">
                <h3>{{ ticket_data.title }}</h3>
                <p><strong>Priority:</strong> {{ ticket_data.priority }}</p>
                <p><strong>Type:</strong> {{ ticket_data.ticket_type }}</p>
                <p><strong>Description:</strong> {{ ticket_data.description }}</p>
                
                {% if ticket_data.ai_notes %}
                <div style="background-color: #f0f8ff; padding: 10px; margin-top: 10px;">
                    <h4>AI Analysis Notes:</h4>
                    <p>{{ ticket_data.ai_notes }}</p>
                </div>
                {% endif %}
            </div>
            
            <p>Please log in to the system to view and manage this ticket.</p>
        </body>
        </html>
        """)
        
        html_content = template.render(ticket_data=ticket_data)
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"New Ticket Assigned: {ticket_data['title']}"
        msg['From'] = self.from_email
        msg['To'] = moderator_email
        
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                self._send_email_sync,
                msg
            )
            print(f"Email sent to {moderator_email}")
        except Exception as e:
            print(f"Email sending error: {e}")
    
    def _send_email_sync(self, msg):
        """Synchronous email sending function"""
        with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)

email_service = EmailService()
