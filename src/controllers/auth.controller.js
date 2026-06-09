const DEVELOPMENT_USER_ID = "507f1f77bcf86cd799439011";

export function login(request, response) {
  const username = request.body.username?.trim();
  const password = request.body.password;

  if (!username || !password) {
    return response
      .status(400)
      .json({ message: "Username and password are required" });
  }

  response.json({
    user: {
      id: DEVELOPMENT_USER_ID,
      username,
    },
  });
}
