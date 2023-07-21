import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { html } from "@elysiajs/html";
import * as elements from "typed-html";

const app = new Elysia()
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "TO-DO App: Elysia",
          version: "1.0.0",
          description: "TO-DO App: Elysia API",
        },
        servers: [
          {
            url: "http://localhost:3000",
            description: "Local server",
          },
        ],
        tags: [
          {
            name: "User",
            description: "User API",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
      },
    })
  )
  .use(html())
  .get("/html", ({ html }) =>
    html(
      <BaseHtml>
        <body>
          <div class="pt-6 bg-black text-white flex flex-col items-center justify-top min-h-screen">
            <h1 class="text-4xl font-bold">Introduction to the BETH Stack</h1>
            <p class="text-xl">This is a simple HTML page rendered by Elysia</p>
            <div class="pt-8">
              <button
                type="button"
                class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 rounded-full"
                hx-post="/clicked"
                hx-swap="outerHTML"
              >
                Click Me
              </button>
            </div>
            <div class="pt-8 text-white">
              <p>TO-DO List</p>
            </div>
            <div
              class="pt-2 flex p-2"
              hx-get="/todos"
              hx-trigger="load"
              hx-swap="innerHTML"
            ></div>
          </div>
        </body>
      </BaseHtml>
    )
  )
  .get("/todos", () => <TodoList todos={db} />)
  .get("/", () => "Hello World!")
  .post("/clicked", () => (
    <div class="text-white">Clicked! I'm from the server!</div>
  ))
  .post(
    "/todos",
    ({ body }) => {
      console.log(body);
      if (!body.text) {
        return <div class="text-white">Text is required</div>;
      }
      const newTodo = {
        id: db.length + 1,
        text: body.text,
        completed: false,
      };
      db.push(newTodo);
      return <TodoItem {...newTodo} />;
    },
    // Body validation
    {
      body: t.Object({
        text: t.String(),
      }),
    }
  )
  .post(
    "/todos/toggle/:id",
    ({ params }) => {
      const todo = db.find((todo) => todo.id === Number(params.id));
      if (todo) {
        todo.completed = !todo.completed;
        return <TodoItem {...todo} />;
      }
    },
    // Params validation
    {
      params: t.Object({
        id: t.Any(),
      }),
    }
  )
  .delete(
    "/todos/:id",
    ({ params }) => {
      const index = db.findIndex((todo) => todo.id === Number(params.id));
      if (index !== -1) {
        db.splice(index, 1);
        return <TodoList todos={db} />;
      }
    },
    // Params validation
    {
      params: t.Object({
        id: t.Any(),
      }),
    }
  )
  .listen(3000);

const BaseHtml = ({ children }: elements.Children) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Introduction to the BETH Stack</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" referrerpolicy="no-referrer" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/htmx/1.9.3/htmx.min.js" integrity="sha512-+tp2z7fiP5/7Q3DZZkHXaV1BjgtkLuV4vX7khfzKqVJ+/55LWr7Ulz0cqIS1AlB+wmZW6oAkE64VN2sjFXs6dA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    </head>
    ${children}
  </html>
`;

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

const db: Todo[] = [
  { id: 1, text: "Buy milk", completed: false },
  { id: 2, text: "Go for choir practice", completed: false },
  { id: 3, text: "Finish Data Structures Assignment", completed: false },
  { id: 4, text: "Finish React Assignment", completed: false },
];

function TodoItem({ id, text, completed }: Todo) {
  return (
    <div class="pt-8 flex items-center justify-between p-8 bg-gray shadow-xs dark:bg-gray-800">
      <input
        type="checkbox"
        checked={completed}
        class="w-6 h-6 rounded-md"
        hx-post={`/todos/toggle/${id}`}
        hx-target="closest div"
        hx-swap="outerHTML"
      />
      <p class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
        {text}
      </p>
      <button
        type="button"
        class="text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-700 dark:border-red-700 rounded-full"
        hx-delete={`/todos/${id}`}
        hx-target="#todo-list"
      >
        Delete
      </button>
    </div>
  );
}

function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div id="todo-list">
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
      <ToDoForm />
    </div>
  );
}

function ToDoForm() {
  return (
    <form
      hx-post="/todos"
      hx-swap="beforebegin"
      class="mr-2 pt-8 flex items-center justify-between p-8 bg-gray shadow-xs dark:bg-gray-800"
    >
      <input
        type="text"
        name="text"
        placeholder="Enter a todo"
        class="text-black focus:outline-none font-medium rounded h-10 px-4 w-full mr-2 mb-2"
      />
      <button
        type="submit"
        class="text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-700 dark:border-green-700 rounded-full"
      >
        Add To-Do
      </button>
    </form>
  );
}

console.info(
  `Elysia is running on http://${app.server?.hostname}:${app.server?.port}`
);
