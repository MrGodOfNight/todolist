
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;

namespace back
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            // 1.Добавляем сервисы MVC с конфигурацией
            builder.Services.AddControllers(options =>
            {
                // Глобальные настройки для всех контроллеров
                options.RespectBrowserAcceptHeader = true; // Учитывать заголовок Accept
            
                // Настройки форматирования
                options.ReturnHttpNotAcceptable = true; // Возвращать 406 если неподдерживаемый формат
            
                // Глобальные фильтры
                options.Filters.Add<GlobalExceptionFilter>();
                options.Filters.Add<RequestLoggingFilter>();
            });

            // 2. Настройка маршрутизации с кастомными настройками
            builder.Services.AddRouting(options =>
            {
                options.LowercaseUrls = true; // Приводить URL к нижнему регистру
                options.AppendTrailingSlash = false; // Не добавлять слэш в конце
            });

            // Настройка валидации
            builder.Services.Configure<ApiBehaviorOptions>(options =>
            {
                // Кастомный обработчик для автоматической валидации ModelState
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .SelectMany(x => x.Value!.Errors)
                        .Select(x => x.ErrorMessage)
                        .ToArray();

                    var problemDetails = new ValidationProblemDetails(context.ModelState)
                    {
                        Title = "Ошибка валидации запроса",
                        Detail = "Одно или несколько полей содержат неверные значения",
                        Status = StatusCodes.Status400BadRequest,
                        Type = "https://example.com/errors/validation",
                        Instance = context.HttpContext.Request.Path,
                        Extensions = {
                { "traceId", context.HttpContext.TraceIdentifier },
                { "timestamp", DateTime.UtcNow }
            }
                    };

                    return new BadRequestObjectResult(problemDetails)
                    {
                        ContentTypes = { "application/problem+json" }
                    };
                };
            });

            // 4. Настройка Swagger для документации
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "My API",
                    Version = "v1",
                    Description = "API with advanced routing examples"
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            // 5. Middleware pipeline
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
                    c.RoutePrefix = string.Empty; // Swagger на корневом пути
                });
            }

            app.UseHttpsRedirection();
            app.UseRouting(); // Middleware для маршрутизации

            // 6. Аутентификация и авторизация (должна быть после UseRouting)
            app.UseAuthentication();
            app.UseAuthorization();

            // 7. Активация контроллеров с параметрами
            app.MapControllers()
               .RequireAuthorization(); // Требовать авторизацию для всех эндпоинтов (можно переопределить)

            // 8. Минимальные API эндпоинты
            app.MapGet("/health", () => Results.Ok(new { status = "Healthy", timestamp = DateTime.UtcNow }))
               .WithName("HealthCheck")
               .WithTags("System");

            // ПРАВИЛЬНО: сначала конкретные маршруты
            app.MapGet("/api/products/featured", () => "Featured products");
            app.MapGet("/api/products/{id}", (int id) => $"Product {id}");
            app.MapGet("/api/products", () => "All products");

            // НЕПРАВИЛЬНО: общий маршрут перехватит все запросы
            app.MapGet("/api/products", () => "All products"); // Этот маршрут перехватит все запросы
            app.MapGet("/api/products/{id}", (int id) => $"Product {id}"); // Никогда не будет вызван
            app.MapGet("/api/products/featured", () => "Featured products"); // Никогда не будет вызван

            app.Run();
        }
    }
}
