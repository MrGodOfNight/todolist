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
                var todos = await _todoRepo.GetTodos(userId);
                return todos;
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
                var req = await _todoRepo.CreateTodo(newTodo);
                return req;
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
                var req = await _todoRepo.UpdateTodo(newTodo);
                return req;
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
                var req = await _todoRepo.DeleteTodo(id);
                return req;
            }
            catch
            {
                return null;
            }
        }
    }
}
