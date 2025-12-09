using back.Domain;
using back.Repository;

namespace back.Service
{
    public interface ITodoService
    {
        Task<List<Todo>> GetTodos(int userId);
        Task<Todo> CreateTodo(int userId, CreateTodoRequest todo);
        Task<Todo> UpdateTodo(int id, UpdateTodoRequest todo);
        Task<Todo> DeleteTodo(int id);
    }
    public class TodoService : ITodoService
    {
        private readonly ITodoRepo _todoRepo;

        public TodoService(ITodoRepo todoRepo)
        {
            _todoRepo = todoRepo;
        }

        public async Task<List<Todo>> GetTodos(int userId)
        {
            try
            {
                return await _todoRepo.GetTodos(userId);
            }
            catch
            {
                return null;
            }
        }

        public async Task<Todo> CreateTodo(int userId, CreateTodoRequest todo)
        {
            var newTodo = new Todo()
            {
                Name = todo.Name,
                Description = todo.Description,
                IsCompleted = todo.IsCompleted,
                UserId = userId,
            };
            try
            {
                return await _todoRepo.CreateTodo(newTodo);
            }
            catch
            {
                return null;
            }
        }

        public async Task<Todo> UpdateTodo(int id, UpdateTodoRequest todo)
        {
            var newTodo = new Todo()
            {
                Id = id,
                Name = todo.Name,
                Description = todo.Description,
                IsCompleted = todo.IsCompleted
            };
            try
            {
                return await _todoRepo.UpdateTodo(newTodo);
            }
            catch
            {
                return null;
            }
        }

        public async Task<Todo> DeleteTodo(int id)
        {
            try
            {
                return await _todoRepo.DeleteTodo(id);
            }
            catch
            {
                return null;
            }
        }
    }
}
