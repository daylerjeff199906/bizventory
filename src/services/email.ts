import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const urlWeb = process.env.NEXT_PUBLIC_APP_URL || 'https://bizventory.vercel.app';
interface WelcomeEmailProps {
  firstName: string;
  email: string;
  password?: string;
}

export async function sendWelcomeEmail({ firstName, email, password }: WelcomeEmailProps) {
  try {
    // Como ya tienes el dominio 'jorgeantonio.site' verificado, puedes enviar correos a cualquier destino.
    const { data, error } = await resend.emails.send({
      from: 'Bizventory <admin@asipe.site>',
      to: [email],
      subject: 'Bienvenido a Bizventory - Tus Credenciales',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">¡Bienvenido, ${firstName}!</h2>
          <p style="color: #555;">Tu cuenta en Bizventory ha sido creada exitosamente. A continuación encontrarás tus credenciales de acceso:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Correo:</strong> ${email}</p>
            ${password ? `<p style="margin: 5px 0;"><strong>Contraseña Temporal:</strong> ${password}</p>` : ''}
          </div>

          <p style="color: #555;">Por favor, inicia sesión y cambia tu contraseña lo antes posible por una de tu preferencia.</p>
          
          <a href="${urlWeb}/login" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Iniciar Sesión</a>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">Si no solicitaste esta cuenta, por favor contacta al administrador.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
