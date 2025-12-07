using System.ComponentModel.DataAnnotations;

namespace back.Domain
{
    public class LoginRequest
    {
        [Required]
        [Length(1, 100)]
        public string Login {  get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
