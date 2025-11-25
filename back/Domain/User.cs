namespace back.Domain
{
    public class User
    {
        public int Id { get; set; }
        public string Login { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public List<Todo> Todos { get; set; } = new List<Todo>();
    }
}
