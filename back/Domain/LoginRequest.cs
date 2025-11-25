using System.ComponentModel.DataAnnotations;

namespace back.Domain
{
    public class LoginRequest
    {
        [Required(ErrorMessage ="Поле не должно быть пустым!")]
        [Length(1, 100, ErrorMessage = "Поле должно быть от 1 до 100 символов!")]
        public string Login { get; set; } = string.Empty;
        [Required(ErrorMessage = "Поле не должно быть пустым!")]
        public string Password { get; set; } = string.Empty;
    }
}
