
import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  ReactNode 
} from "react";
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type UserRole = "admin" | "user";

interface UserData {
  uid: string;
  email: string | null;
  role: UserRole;
  name?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Mock user data for frontend-only development
const MOCK_USERS = [
  {
    uid: "admin123",
    email: "admin@example.com",
    role: "admin" as UserRole,
    name: "Admin User"
  },
  {
    uid: "user123",
    email: "user@example.com",
    role: "user" as UserRole,
    name: "Regular User"
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Simulating auth state for frontend-only development
  useEffect(() => {
    console.log("Setting up mock auth state");
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Frontend-only mock login
      if (email === "admin@example.com" && password === "password") {
        // Mock admin login
        const mockAdminData = MOCK_USERS[0];
        setCurrentUser({ uid: mockAdminData.uid, email: mockAdminData.email } as User);
        setUserData(mockAdminData);
        toast({
          title: "Login successful",
          description: "Welcome back to Green Pastures!",
        });
        navigate("/dashboard");
      } else if (email === "user@example.com" && password === "password") {
        // Mock regular user login
        const mockUserData = MOCK_USERS[1];
        setCurrentUser({ uid: mockUserData.uid, email: mockUserData.email } as User);
        setUserData(mockUserData);
        toast({
          title: "Login successful",
          description: "Welcome back to Green Pastures!",
        });
        navigate("/dashboard");
      } else {
        // Mock invalid credentials
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      // Frontend-only mock registration
      const newUser = {
        uid: `user_${Date.now()}`,
        email: email,
        role: "user" as UserRole,
        name: name
      };
      
      setCurrentUser({ uid: newUser.uid, email: newUser.email } as User);
      setUserData(newUser);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Frontend-only mock logout
      setCurrentUser(null);
      setUserData(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const isAdmin = userData?.role === "admin";

  const value = {
    currentUser,
    userData,
    login,
    register,
    logout,
    loading,
    isAdmin,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
