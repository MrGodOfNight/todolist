using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace back.Domain
{
    // Основная модель для создания продукта
    public class ProductCreateModel
    {
        [Required(ErrorMessage = "Название продукта обязательно")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Название должно быть от 3 до 100 символов")]
        [RegularExpression(@"^[a-zA-Zа-яА-Я0-9\s\-_]+$", ErrorMessage = "Название содержит недопустимые символы")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Описание обязательно")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Описание должно быть от 10 до 500 символов")]
        public string Description { get; set; } = string.Empty;

        [Range(0.01, 10000, ErrorMessage = "Цена должна быть от 0.01 до 10000")]
        [DataType(DataType.Currency)]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Категория обязательна")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Категория должна быть от 2 до 50 символов")]
        public string Category { get; set; } = string.Empty;

        [Url(ErrorMessage = "Неверный формат URL изображения")]
        public string? ImageUrl { get; set; } //https://smth/

        [Range(0, 1000, ErrorMessage = "Количество должно быть от 0 до 1000")]
        public int StockQuantity { get; set; }

        [DataType(DataType.DateTime)]
        [JsonIgnore] // Игнорируем при десериализации, устанавливаем в коде
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [DataType(DataType.DateTime)]
        [JsonIgnore]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Дополнительные данные, которые не приходят от клиента
        [JsonIgnore]
        public Guid CreatedBy { get; set; }

        [JsonIgnore]
        public bool IsActive { get; set; } = true;
    }

    // Расширенная модель для ответа
    public class ProductResponseModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int StockQuantity { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        // HATEOAS ссылки
        public List<Link> Links { get; set; } = new();

        public class Link
        {
            public string Rel { get; set; } = string.Empty;
            public string Href { get; set; } = string.Empty;
            public string Method { get; set; } = string.Empty;
        }
    }

    // Модель для обновления продукта (отличается от создания)
    public class ProductUpdateModel
    {
        [Required(ErrorMessage = "ID продукта обязателен")]
        [Range(1, int.MaxValue, ErrorMessage = "Неверный ID продукта")]
        public int Id { get; set; }

        [StringLength(100, MinimumLength = 3, ErrorMessage = "Название должно быть от 3 до 100 символов")]
        public string? Name { get; set; }

        [StringLength(500, MinimumLength = 10, ErrorMessage = "Описание должно быть от 10 до 500 символов")]
        public string? Description { get; set; }

        [Range(0.01, 10000, ErrorMessage = "Цена должна быть от 0.01 до 10000")]
        public decimal? Price { get; set; }

        [StringLength(50, MinimumLength = 2, ErrorMessage = "Категория должна быть от 2 до 50 символов")]
        public string? Category { get; set; }

        [Url(ErrorMessage = "Неверный формат URL изображения")]
        public string? ImageUrl { get; set; }

        [Range(0, 1000, ErrorMessage = "Количество должно быть от 0 до 1000")]
        public int? StockQuantity { get; set; }
    }
}
