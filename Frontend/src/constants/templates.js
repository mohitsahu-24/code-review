export const CODE_TEMPLATES = {
  javascript: `function fetchUserData(userId) {
  // Synchronous XHR blocking UI thread & hardcoded URL
  var url = "http://api.example.com/users/" + userId;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false); 
  xhr.send();
  
  if (xhr.status == 200) {
    return JSON.parse(xhr.responseText);
  }
}`,
  typescript: `interface User {
  id: number;
  role: string;
}

function getAdminUser(users: User[]): User {
  // Potential runtime error if array is empty or search fails (returns undefined instead of User)
  return users.find(u => u.role === "admin");
}`,
  python: `def calculate_factorial(n):
    # Potential infinite recursion and no type validation
    if n == 0:
        return 1
    return n * calculate_factorial(n - 1)
`,
  go: `package main
import "fmt"

func main() {
    // Nil pointer dereference crash (undefined memory access)
    var p *int
    fmt.Println(*p)
}`,
  rust: `fn get_element(vector: Vec<i32>, index: usize) -> i32 {
    // rust panics if index is out of bounds
    vector[index]
}`,
  java: `public class DataStore {
    // Security risk: public static credentials
    public static final String API_KEY = "gsk_secret_auth_39281a82";
    
    public void processData(String query) {
        // Potential SQL injection risk
        String sql = "SELECT * FROM users WHERE name = '" + query + "'";
        System.out.println("Executing: " + sql);
    }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    int numbers[5] = {1, 2, 3, 4, 5};
    // Out of bounds buffer read (undefined behavior)
    for(int i = 0; i <= 5; ++i) {
        cout << numbers[i] << " ";
    }
    return 0;
}`,
  sql: `-- Unsafe query vulnerable to SQL Injection
SELECT * FROM users 
WHERE username = '` + `admin` + `' AND password = '` + `12345` + `';`,
  html: `<!-- Unsecured and inaccessible HTML structure -->
<div class="header">
  <img src="banner.png"> <!-- Missing alt tag -->
  <button onclick="deleteAccount()">Delete Account</button>
  <a href="#" onclick="logout()">Log out</a> <!-- Bad navigation practice -->
</div>`,
  css: `/* Inefficient selectors and bad formatting standards */
div ul li div a span {
  color: red !important; /* Overuse of !important */
  font-size: 14px;
}`
};
