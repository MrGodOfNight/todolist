using back.Domain;
using Microsoft.EntityFrameworkCore;

namespace back.Repository
{
    public interface IUserRepo
    {
        Task<User> GetUser(string login);
        Task<User> AddUser(string login, string password);
    }
    public class UserRepo : IUserRepo
    {
        private readonly AppDbContext _context;

        public UserRepo(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> GetUser(string login)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Login == login);
            return user;
        }
        public async Task<User> AddUser(string login, string password)
        {
            try
            {
                // Добавляем в контекст
                _context.Users.Add(new User
                {
                    Login = login,
                    Password = password
                });
                // Сохраняем изменения - здесь генерируется Id
                await _context.SaveChangesAsync();

                // Возвращаем добавленного пользователя
                return await GetUser(login);
            }
            catch
            {
                return null;
            }
            
        }
    }
}
