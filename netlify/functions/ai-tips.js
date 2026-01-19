export async function handler(event) {
  try {
    // Frontend থেকে আসা হিসাব
    const { income, expense, total } = JSON.parse(event.body || "{}");

    // AI prompt (user input নেয় না)
    const prompt = `
You are a financial assistant.
User summary:
- Income: ${income} BDT
- Expense: ${expense} BDT
- Balance: ${total} BDT

Give ONE short, practical financial tip.
No greeting. No emojis. Simple language.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    const tip =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Try to save a small amount regularly.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ tip })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        tip: "AI tip load korte parini. Pore try koro."
      })
    };
  }
}