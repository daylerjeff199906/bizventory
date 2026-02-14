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

interface PasswordResetEmailProps {
  email: string;
  resetLink: string;
}

export async function sendPasswordResetEmail({ email, resetLink }: PasswordResetEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Bizventory <admin@asipe.site>',
      to: [email],
      subject: 'Recuperación de Contraseña - Bizventory',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Recuperación de Contraseña</h2>
          <p style="color: #555;">Hemos recibido una solicitud para restablecer tu contraseña en Bizventory. Si fuiste tú, haz clic en el siguiente enlace:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer Contraseña</a>
          </div>

          <p style="color: #555;">Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
          <p style="color: #0070f3; word-break: break-all;">${resetLink}</p>

          <p style="color: #999; font-size: 12px; margin-top: 30px;">Este enlace expirará en una hora. Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }

    console.log('Password reset email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}
