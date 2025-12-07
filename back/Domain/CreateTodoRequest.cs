using System.ComponentModel.DataAnnotations;

namespace back.Domain
{
    public class CreateTodoRequest
    {
        [Required]
        [Length(1, 255)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
    }
}
