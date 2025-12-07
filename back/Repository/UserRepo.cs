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
            try
            {
                var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Login == login);
                return user;
            }
            catch
            {
                return null;
            }
            
        }

        public async Task<User> AddUser(string login, string password)
        {
            try
            {
                _context.Users.Add(new User
                {
                    Login = login,
                    Password = password
                });
                await _context.SaveChangesAsync();

                return await GetUser(login);
            }
            catch
            {
                return null;
            }
        }
    }
}
