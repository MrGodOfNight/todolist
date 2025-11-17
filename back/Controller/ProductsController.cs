using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Services;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace back.Controller
{
    // Глобальные атрибуты для всего контроллера
    [ApiController]
    [Route("api/v1/[controller]")] // Шаблон с версионированием
    [Produces("application/json")] // Поддерживаемые форматы
    [Consumes("application/json")] // Ожидаемые форматы
    [ProducesResponseType(StatusCodes.Status400BadRequest)] // Глобальная документация ошибок
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public class ProductsController : ControllerBase
    {
        private readonly IProductRepository _repository;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(
            IProductRepository repository,
            ILogger<ProductsController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        //! ШАБЛОНЫ:

        // Базовые шаблоны
        [Route("api/[controller]")] // [controller] заменяется на имя контроллера (Products)
        [Route("api/[controller]/[action]")] // [action] заменяется на имя метода (GetAll)

        // Параметры маршрута
        [HttpGet("{id}")] // Простой параметр
        [HttpGet("{id:int}")] // Ограничение типа (только числа)
        [HttpGet("{id:int:min(1)}")] // Ограничение диапазона
        [HttpGet("{category:alpha}")] // Только буквы
        [HttpGet("{code:regex(^\\d{{3}}-\\d{{2}}-\\d{{4}}$)}")] // Регулярное выражение

        // Необязательные параметры
        [HttpGet("{id?}")] // ? означает необязательный параметр
        [HttpGet("{id:int?}")] // Необязательный числовой параметр

        // Составные параметры
        [HttpGet("category/{category}/price/{min}-{max}")] // category=electronics&min=100&max=500
                                                           //!

        //! ОГРАНИЧЕНИЯ МАРШРУТОВ

        // Стандартные ограничения
        [HttpGet("{id:int}")] // Целое число
        [HttpGet("{id:long}")] // Длинное целое
        [HttpGet("{price:decimal}")] // Десятичное число
        [HttpGet("{date:datetime}")] // Дата и время
        [HttpGet("{id:guid}")] // GUID
        [HttpGet("{email:email}")] // Email
        [HttpGet("{category:alpha}")] // Только буквы
        [HttpGet("{name:length(3,10)}")] // Длина строки от 3 до 10 символов
        [HttpGet("{name:minlength(3)}")] // Минимальная длина
        [HttpGet("{name:maxlength(10)}")] // Максимальная длина
        [HttpGet("{code:regex(^[A-Z0-9]{{3}}$)}")] // Регулярное выражение
        [HttpGet("{category:range(1,100)}")] // Диапазон чисел

        //!

        /// <summary>
        /// Получить все продукты
        /// </summary>
        /// <returns>Список продуктов</returns>
        /// <response code="200">Успешное получение списка продуктов</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
        [ResponseCache(Duration = 60)] // Кэширование на 60 секунд
        [AllowAnonymous] // Разрешить доступ без авторизации
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? sortBy = null,
            [FromQuery] string? sortOrder = "asc")
        {
            _logger.LogInformation("Getting all products with pagination: page={Page}, pageSize={PageSize}", page, pageSize);

            var query = _repository.GetAllQueryable();

            // Применение сортировки
            if (!string.IsNullOrEmpty(sortBy))
            {
                query = sortBy.ToLower() switch
                {
                    "name" => sortOrder == "desc"
                        ? query.OrderByDescending(p => p.Name)
                        : query.OrderBy(p => p.Name),
                    "price" => sortOrder == "desc"
                    : query.OrderByDescending(p => p.Price)
                    : query.OrderBy(p => p.Price),
                    _ => query.OrderBy(p => p.Id)
                };
            }
            else
            {
                query = query.OrderBy(p => p.Id);
            }

            // Применение пагинации
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var response = _mapper.Map<List<ProductResponse>>(products);

            _logger.LogInformation("Returned {Count} products", response.Count);
            return Ok(response);
        }

        /// <summary>
        /// Получить продукт по ID
        /// </summary>
        /// <param name="id">ID продукта</param>
        /// <returns>Данные продукта</returns>
        /// <response code="200">Продукт успешно найден</response>
        /// <response code="404">Продукт не найден</response>
        [HttpGet("{id:int:min(1):max(1000)}")] // Ограничения для параметра
        [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            _logger.LogInformation("Getting product with ID: {Id}", id);

            var product = await _repository.GetByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product with ID {Id} not found", id);
                return NotFound(new
                {
                    message = "Product not found",
                    timestamp = DateTime.UtcNow
                });
            }

            var response = _mapper.Map<ProductResponse>(product);
            return Ok(response);
        }

        /// <summary>
        /// Получить продукты по категории
        /// </summary>
        /// <param name="category">Категория продукта</param>
        /// <param name="minPrice">Минимальная цена</param>
        /// <param name="maxPrice">Максимальная цена</param>
        /// <returns>Список отфильтрованных продуктов</returns>
        [HttpGet("category/{category:alpha:length(3,20)}")] // Ограничения для строки
        [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByCategory(
            string category,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null)
        {
            _logger.LogInformation("Filtering products by category: {Category}, minPrice: {MinPrice}, maxPrice: {MaxPrice}",
                category, minPrice, maxPrice);

            var products = await _repository.GetByCategoryAsync(category);

            // Дополнительная фильтрация по цене
            if (minPrice.HasValue)
                products = products.Where(p => p.Price >= minPrice.Value).ToList();

            if (maxPrice.HasValue)
                products = products.Where(p => p.Price <= maxPrice.Value).ToList();

            var response = _mapper.Map<List<ProductResponse>>(products);
            return Ok(response);
        }

        /// <summary>
        /// Поиск продуктов с автозаполнением
        /// </summary>
        /// <param name="query">Строка поиска</param>
        /// <param name="limit">Максимальное количество результатов</param>
        /// <returns>Результаты поиска</returns>
        [HttpGet("search/{query:minlength(2):maxlength(50)}")]
        [ProducesResponseType(typeof(IEnumerable<SearchResult>), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchProducts(
            string query,
            [FromQuery] int limit = 10)
        {
            _logger.LogInformation("Searching products with query: '{Query}', limit: {Limit}", query, limit);

            // Защита от DOS-атак
            if (limit > 50) limit = 50;

            var results = await _repository.SearchAsync(query, limit);
            return Ok(results);
        }

        /// <summary>
        /// Получить ревью продуктов
        /// </summary>
        /// <param name="productId">ID продукта</param>
        /// <param name="rating">Минимальный рейтинг</param>
        /// <returns>Ревью продукта</returns>
        [HttpGet("{productId:int:min(1)}/reviews")]
        [ProducesResponseType(typeof(IEnumerable<ProductReviewResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProductReviews(
            int productId,
            [FromQuery] int? rating = null)
        {
            _logger.LogInformation("Getting reviews for product ID: {ProductId}, min rating: {Rating}", productId, rating);

            var reviews = await _repository.GetProductReviewsAsync(productId);

            if (rating.HasValue)
                reviews = reviews.Where(r => r.Rating >= rating.Value).ToList();

            var response = _mapper.Map<List<ProductReviewResponse>>(reviews);
            return Ok(response);
        }

        /// <summary>
        /// Получить продукты с составными ключами
        /// </summary>
        [HttpGet("{categoryId:int:min(1)}/{subcategory:regex(^[a-z0-9-]{3,20}$)}")]
        [ProducesResponseType(typeof(IEnumerable<ProductResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByCategoryAndSubcategory(int categoryId, string subcategory)
        {
            _logger.LogInformation("Getting products by categoryId={CategoryId} and subcategory={Subcategory}",
                categoryId, subcategory);

            var products = await _repository.GetByCategoryAndSubcategoryAsync(categoryId, subcategory);
            return Ok(_mapper.Map<List<ProductResponse>>(products));
        }

        /// <summary>
        /// Создать новый продукт
        /// </summary>
        /// <param name="createModel">Данные для создания продукта</param>
        /// <returns>Созданный продукт</returns>
        /// <response code="201">Продукт успешно создан</response>
        /// <response code="400">Неверные данные для создания</response>
        [HttpPost]
        [Authorize(Roles = "Admin")] // Требовать роль Admin
        [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody, Required] ProductCreateModel createModel)
        {
            _logger.LogInformation("Creating new product with name: {Name}", createModel.Name);

            // Валидация модели (альтернатива ModelState.IsValid)
            var validationResult = await new ProductCreateValidator().ValidateAsync(createModel);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning("Validation failed for product creation: {Errors}",
                    string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage)));

                return ValidationProblem(validationResult.ToDictionary());
            }

            // Проверка уникальности имени
            if (await _repository.ExistsByNameAsync(createModel.Name))
            {
                _logger.LogWarning("Product with name '{Name}' already exists", createModel.Name);
                ModelState.AddModelError("Name", "Product with this name already exists");
                return ValidationProblem(ModelState);
            }

            var product = _mapper.Map<Product>(createModel);
            product.CreatedAt = DateTime.UtcNow;
            product.CreatedBy = User.Identity?.Name;

            await _repository.AddAsync(product);
            await _repository.SaveChangesAsync();

            var response = _mapper.Map<ProductResponse>(product);

            // Создаем Location header с маршрутом к новому ресурсу
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, response);
        }

        /// <summary>
        /// Частичное обновление продукта
        /// </summary>
        /// <param name="id">ID продукта</param>
        /// <param name="updateModel">Данные для обновления</param>
        /// <returns>Обновленный продукт</returns>
        [HttpPatch("{id:int:min(1)}")]
        [Authorize(Roles = "Admin,Editor")]
        [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdatePartial(
            int id,
            [FromBody] JsonPatchDocument<ProductUpdateModel> patchDocument)
        {
            _logger.LogInformation("Partially updating product with ID: {Id}", id);

            var product = await _repository.GetByIdAsync(id);
            if (product == null)
            {
                _logger.LogWarning("Product with ID {Id} not found for partial update", id);
                return NotFound();
            }

            var updateModel = _mapper.Map<ProductUpdateModel>(product);

            // Применяем патч
            patchDocument.ApplyTo(updateModel, ModelState);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state for partial update: {Errors}",
                    string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return ValidationProblem(ModelState);
            }

            // Обновляем сущность
            _mapper.Map(updateModel, product);
            product.UpdatedAt = DateTime.UtcNow;
            product.UpdatedBy = User.Identity?.Name;

            await _repository.UpdateAsync(product);
            await _repository.SaveChangesAsync();

            var response = _mapper.Map<ProductResponse>(product);
            return Ok(response);
        }

        /// <summary>
        /// Экспорт продуктов в CSV
        /// </summary>
        [HttpGet("export")]
        [Produces("text/csv")] // Указываем конкретный формат ответа
        [ResponseCache(Duration = 300)] // Кэширование на 5 минут
        public async Task<IActionResult> ExportToCsv(
            [FromQuery] string? category = null,
            [FromQuery] decimal? minPrice = null)
        {
            _logger.LogInformation("Exporting products to CSV with filters: category={Category}, minPrice={MinPrice}",
                category, minPrice);

            var products = await _repository.GetAllAsync();

            if (!string.IsNullOrEmpty(category))
                products = products.Where(p => p.Category == category).ToList();

            if (minPrice.HasValue)
                products = products.Where(p => p.Price >= minPrice.Value).ToList();

            var csvContent = GenerateCsvContent(products);

            // Устанавливаем правильные заголовки для CSV
            Response.Headers.Add("Content-Disposition", "attachment; filename=products.csv");
            return Content(csvContent, "text/csv");
        }

        /// <summary>
        /// Получить продукт с кастомным маршрутом
        /// </summary>
        [Route("/api/custom/products/{id:int}")] // Полный путь вместо шаблона
        [HttpGet]
        [ApiExplorerSettings(IgnoreApi = true)] // Исключить из документации Swagger
        public async Task<IActionResult> GetWithCustomRoute(int id)
        {
            _logger.LogInformation("Getting product with custom route, ID: {Id}", id);
            return await GetById(id); // Переиспользуем существующий метод
        }

        /// <summary>
        /// Асинхронная обработка длительной операции
        /// </summary>
        [HttpPost("batch-processing")]
        [RequestSizeLimit(100_000_000)] // 100 MB limit
        [RequestFormLimits(MultipartBodyLengthLimit = 100_000_000)]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status413PayloadTooLarge)]
        public IActionResult StartBatchProcessing(
            [FromForm] IFormFile file,
            [FromForm] string processingType)
        {
            _logger.LogInformation("Starting batch processing with file: {FileName}, type: {Type}",
                file?.FileName, processingType);

            if (file == null || file.Length == 0)
            {
                ModelState.AddModelError("file", "File is required");
                return BadRequest(ModelState);
            }

            if (file.Length > 100_000_000) // 100 MB
            {
                _logger.LogWarning("File size exceeds limit: {Size} bytes", file.Length);
                return StatusCode(413, "File size exceeds 100 MB limit");
            }

            // Генерируем уникальный ID для отслеживания
            var operationId = Guid.NewGuid().ToString();

            // Запускаем обработку в фоновом режиме
            _ = Task.Run(async () =>
            {
                try
                {
                    await ProcessBatchFileAsync(file, processingType, operationId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing batch file {OperationId}", operationId);
                }
            });

            // Возвращаем 202 Accepted с Location для проверки статуса
            return AcceptedAtAction(nameof(GetOperationStatus), new { id = operationId }, new
            {
                operationId,
                status = "processing",
                estimatedCompletionTime = DateTime.UtcNow.AddMinutes(5)
            });
        }

        private string GenerateCsvContent(IEnumerable<Product> products)
        {
            var csv = new StringBuilder();
            csv.AppendLine("Id,Name,Price,Category,InStock");

            foreach (var product in products)
            {
                csv.AppendLine($"{product.Id},{product.Name},{product.Price},{product.Category},{product.InStock}");
            }

            return csv.ToString();
        }

    }
}
