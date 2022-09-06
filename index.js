const inquirer = require('inquirer');
const fs = require('fs');
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config()
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
);

function openingPrompt() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'openingPrompt',
      message: 'what would you like to do?',
      choices: ['view all departments',
        'add a department',
        'view all roles',
        'add a role',
        'view all employees',
        'add an employee',
        'update an employee role',
        'quit']
    },
  ])
    .then((promptChoice) => {
      switch (promptChoice.openingPrompt) {
        case 'view all departments':
          viewDepartments();
          break;
        case 'add a department':
          addDepartment();
          break;
        case 'view all roles':
          viewRoles();
          break;
        case 'add a role':
          addRole();
          break;
        case 'view all employees':
          viewEmployees();
          break;
        case 'add an employee':
          addEmployee();
          break;
        case 'update an employee role':
          updateEmployeeRole();
          break;
        default:
          quit();
      }
    });
}

function viewDepartments() {
  db.query('SELECT * FROM department', function (err, results) {
    console.table(results);
        
    openingPrompt();
  });
}

function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'What is the name of the department you would like to add?'
    },
  ]).then(answers => {
    let newDepartment = { department_name: answers.departmentName }
    db.promise().query('INSERT INTO department SET ?', newDepartment).then(dbData => console.log(dbData))
  })
}

function viewRoles() {
  db.query('SELECT * FROM employee_role', function (err, results) {
    console.table(results);
        
    openingPrompt();
  });
}


async function addRole() {
  const [departments] = await db.promise().query('SELECT * FROM department')
  const departmentArray = departments.map(({ id, department_name }) => (
    {
      name: department_name, value: id
    }
  ))
  inquirer.prompt([
    {
      type: 'input',
      name: 'roleName',
      message: 'What is the name of the role you would like to add?'
    },
    {
      type: 'input',
      name: 'roleSalary',
      message: 'What is the salary of this role?'
    },
    {
      type: 'list',
      name: 'existingDepartments',
      message: 'What department does this role belong to?',
      choices: departmentArray
    },
  ]).then(answers => {
    let roleObj = { title: answers.roleName, salary: answers.roleSalary, department_id: answers.existingDepartments }
    db.promise().query('INSERT INTO employee_role SET ?', roleObj).then(dbData => console.log(dbData))
        
    openingPrompt();
  })
}

//TODO pull info from employee role table 
//update inquirer prompt questions
//fix the .then to let returned obj use prompt questions/existing table info
//test 

function viewEmployees() {
  db.query('SELECT * FROM employee', function (err, results) {
    console.table(results);

    openingPrompt();
  });
}


async function addEmployee() {
  const [roles] = await db.promise().query('SELECT * FROM employee_role')
  const roleArray = roles.map(({ title, role_id }) => (
    {
      name: title, value: role_id

    }
  ))
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'What is the first name of the employee you would like to add?'
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'What is the last name of the employee you would like to add?'
    },
    {
      type: 'list',
      name: 'existingRoles',
      message: 'What role does this employee hold?',
      choices: roleArray
    },
    {
      type: 'list',
      name: 'possibleManager',
      message: 'Who is the employees manager?',
      choices: roleArray
    },
  ]).then(answers => {
    let employeeObj = { first_name: answers.firstName, last_name: answers.lastName, role_id: answers.existingRoles }
    db.promise().query('INSERT INTO employee SET ?', employeeObj).then(dbData => console.log(dbData))
        
    openingPrompt();
  })
}

// function quit() {
//   db.query('quit')
//     console.log('See Ya');
//   };

function quit() {   
  db.end(function(err) {
    if (err) {
      return console.log('error:' + err.message);
    }
    console.log('Closed connection. See ya Later');
  });
}   



openingPrompt()