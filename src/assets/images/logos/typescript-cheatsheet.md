# TypeScript Cheatsheet

## Basic Types
```typescript
let name: string = "Mazen";
let age: number = 25;
let isActive: boolean = true;
let tags: string[] = ["dev", "backend"];
let coords: [number, number] = [10, 20]; // tuple
let anything: any = "avoid this when possible";
let nothing: null = null;
let notDefined: undefined = undefined;
```

## Object Types (Interfaces & Type Aliases)
```typescript
// Interface — good for objects/classes, extendable
interface User {
  id: number;
  name: string;
  email?: string; // optional property
}

// Type alias — good for unions, primitives, more flexible
type Status = "active" | "inactive" | "banned";

type Product = {
  id: number;
  price: number;
};
```
Rule of thumb: use `interface` for objects you might extend, `type` for unions or combining multiple types.

## Functions
```typescript
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function with typed params and return
const multiply = (a: number, b: number): number => a * b;

// Optional and default params
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}`;
}

// Function type
type MathFn = (a: number, b: number) => number;
```

## Union & Intersection Types
```typescript
type ID = string | number; // union — can be either

type Employee = User & { salary: number }; // intersection — combines both
```

## Generics
```typescript
// A reusable function that works with any type T
function getFirst<T>(arr: T[]): T {
  return arr[0];
}

getFirst<number>([1, 2, 3]); // T = number
getFirst<string>(["a", "b"]); // T = string

// Generic interface
interface ApiResponse<T> {
  data: T;
  error: string | null;
}
```

## Enums
```typescript
enum Role {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST",
}

const myRole: Role = Role.Admin;
```

## Type Narrowing
```typescript
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // TS knows it's a string here
  } else {
    console.log(id.toFixed(2)); // TS knows it's a number here
  }
}
```

## Utility Types (built-in helpers)
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

Partial<User>;      // all properties optional
Required<User>;      // all properties required
Pick<User, "id" | "name">;   // only pick certain keys
Omit<User, "email">;         // exclude certain keys
Record<string, number>;      // object with string keys, number values
Readonly<User>;              // properties can't be reassigned
```

## Working with React / React Native
```typescript
// Typing props
type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const MyButton = ({ label, onPress, disabled }: ButtonProps) => {
  return <TouchableOpacity onPress={onPress} disabled={disabled} />;
};

// useState with a type
const [user, setUser] = useState<User | null>(null);

// useForm (react-hook-form) with a typed form
type LoginFormData = { email: string; password: string };
const { register, handleSubmit } = useForm<LoginFormData>();
```

## Working with Node.js / Express
```typescript
import { Request, Response, NextFunction } from "express";

app.get("/users/:id", (req: Request, res: Response) => {
  const id = req.params.id; // string
  res.json({ id });
});

// Custom request type (e.g. after auth middleware attaches a user)
interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // attach user, then call next()
  next();
}
```

## Type Assertions
```typescript
const input = document.getElementById("email") as HTMLInputElement;
// "Trust me TS, I know this is an HTMLInputElement"
```

## Common Gotchas
- `interface` vs `type`: interfaces can be re-opened/merged, types can't — but types support unions.
- `any` disables type checking — avoid it; use `unknown` if you truly don't know the type yet, then narrow it.
- Optional (`?`) means the field can be `undefined`, not that it can be missing entirely and untyped.
- Non-null assertion `!` (e.g. `user!.name`) tells TS "trust me, this isn't null" — use sparingly, it can hide real bugs.
