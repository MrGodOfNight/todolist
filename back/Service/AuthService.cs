using back.Domain;
using back.Repository;

namespace back.Service
{
    public interface IAuthService
    {
        Task<string?> Authenticate(LoginRequest request);
        Task<bool> Register(LoginRequest request);
    }

    public class AuthService : IAuthService
    {
        private readonly IJwtService _jwtService;
        private readonly IUserRepo _userRepo;

        public AuthService(IJwtService jwtService, IUserRepo repo)
        {
            _jwtService = jwtService;
            _userRepo = repo;
        }

        public async Task<string?> Authenticate(LoginRequest request)
        {
            try
            {
                var user = await _userRepo.GetUser(request.Login);

                if (user == null || 
                    !PasswordHasher.VerifyPassword(request.Password, user.Password))
                    return null;

                return _jwtService.GenerateToken(user);
            }
            catch (Exception)
            {
                return null;
            }
            
        }

        public async Task<bool> Register(LoginRequest request)
        {
            try
            {
                var hashedPass = PasswordHasher.HashPassword(request.Password);
                var user = await _userRepo.AddUser(request.Login, hashedPass);

                if (user == null)
                {
                    return false;
                }
                else return true;
            }
            catch
            {
                return false;
            }
            
        }
    }
}
