using back.Domain;
using back.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace back.Controller
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Требует аутентификации
    public class TodoController : ControllerBase
    {
        private readonly ITodoService _todoService;

        public TodoController(ITodoService todoService)
        {
            _todoService = todoService;
        }
        private void GetUserId(out int Id)
        {
            // Получаем ID пользователя из ClaimsPrincipal
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out Id))
            {
                Id = -1;
            }
        }
        [HttpGet]
        public async Task<ActionResult<List<Todo>>> GetAll()
        {
            GetUserId(out int Id);
            if (Id == -1) return Unauthorized("Invalid token or password");
            try
            {
                var response = await _todoService.GetTodos(Id);
                if (response == null)
                    return BadRequest("Server error");
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut]
        public async Task<ActionResult<Todo>> CreateTodo([FromBody] CreateTodoRequest request)
        {
            GetUserId(out int Id);
            if (Id == -1) return Unauthorized("Invalid token or password");
            try
            {
                var response = await _todoService.CreateTodo(Id, request);
                if (response == null)
                    return BadRequest("Server error");
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Todo>> DeleteTodo(int id)
        {
            try
            {
                var response = await _todoService.DeleteTodo(id);
                if (response == null)
                    return BadRequest("Server error");
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult<Todo>> UpdateTodo(int id, [FromBody] UpdateTodoRequest request)
        {
            try
            {
                var response = await _todoService.UpdateTodo(id, request);
                if (response == null)
                    return BadRequest("Server error");
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
