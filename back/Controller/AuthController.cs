using back.Domain;
using back.Service;
using Microsoft.AspNetCore.Mvc;

namespace back.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] LoginRequest request)
        {
            try
            {
                var response = await _authService.Authenticate(request);
                if (response == null)
                    return Unauthorized("Invalid token or password");
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<string>> Register([FromBody] LoginRequest request)
        {
            try
            {
                var response = await _authService.Register(request);
                if (response == false)
                    return Unauthorized("Invalid token or password");
                else return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
