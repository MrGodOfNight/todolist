namespace back.Service
{
    public static class PasswordHasher
    {
        public static string HashPassword(string password)
        {
            // workFactor (по умолчанию 11) определяет сложность вычисления.
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
