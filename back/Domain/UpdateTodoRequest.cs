using System.ComponentModel.DataAnnotations;

namespace back.Domain
{
    public class UpdateTodoRequest
    {
        [Length(1, 255)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        [Required]
        public bool IsCompleted { get; set; }
    }
}
