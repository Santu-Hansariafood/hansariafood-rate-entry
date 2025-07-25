export default async function sendWhatsAppMessage({ name, mobile, password }) {
  const apiUrl = `http://official.nkinfo.in/wapp/api/send/reset`;

  try {
    const res = await fetch(
      `${apiUrl}?apikey=cdbcead5dfba4eb7a4b3f16b62dc2bb8&templatename=reset&mobile=${mobile}&var1=${encodeURIComponent(name)}&var2=${encodeURIComponent(mobile)}&var3=${encodeURIComponent(password)}`
    );

    const data = await res.json();

    return {
      success: data.status === "success",
      response: data,
    };
  } catch (error) {
    console.error("WhatsApp API Error:", error);
    return { success: false, error };
  }
}
