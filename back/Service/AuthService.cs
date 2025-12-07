using back.Domain;
using back.Repository;
using Microsoft.AspNetCore.Identity;

namespace back.Service
{
    public interface IAuthService
    {
        Task<string?> Authenticate(LoginRequest request);
        Task<bool> Register(LoginRequest request);
    }
    public class AuthService : IAuthService
    {
        private readonly IUserRepo _userRepo;
        private readonly IJwtService _jwtService;

        public AuthService(IUserRepo userRepo, IJwtService jwtService)
        {
            _userRepo = userRepo;
            _jwtService = jwtService;
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
            catch
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
