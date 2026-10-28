/**
 * Supported programming languages for the code editor.
 * These map to Judge0 language IDs and editor display names.
 */
export const LANGUAGES = [
  { id: 71, name: "Python 3", value: "python" },
  { id: 62, name: "Java", value: "java" },
  { id: 54, name: "C++", value: "cpp" },
  { id: 63, name: "JavaScript", value: "javascript" },
  { id: 74, name: "TypeScript", value: "typescript" },
  { id: 72, name: "Ruby", value: "ruby" },
  { id: 73, name: "Rust", value: "rust" },
  { id: 51, name: "C#", value: "csharp" },
];

/**
 * Default starter code templates for each supported language.
 * Reads from stdin and writes to stdout, compatible with Judge0 test case format.
 */
export const STARTER_CODE: Record<string, string> = {
  python: `import sys

def main():
    # Read all input from standard input
    data = sys.stdin.read().split()
    if not data:
        return
    
    # Write your solution here
    print()

if __name__ == "__main__":
    main()
`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        // Write your solution here
        
        scanner.close();
    }
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your solution here
    
    return 0;
}
`,
  javascript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
    if (!input[0]) return;
    
    // Write your solution here
    
}

main();
`,
  typescript: `const fs = require('fs');

function main() {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
    if (!input[0]) return;
    
    // Write your solution here
    
}

main();
`,
  ruby: `input = $stdin.read.split

# Write your solution here

`,
  rust: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut iter = input.split_whitespace();
    
    // Write your solution here
    
}
`,
  csharp: `using System;

class Main {
    static void Main(string[] args) {
        // Write your solution here
        
    }
}
`,
};
