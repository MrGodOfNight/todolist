import TodoList from "@/_components/TodoList";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-20 pb-12">
      <TodoList />
    </div>
  );
}
