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


//selection menu
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

//display department id and department name in terminal table
function viewDepartments() {
  db.query('SELECT * FROM department', function (err, results) {
    console.table(results);

    openingPrompt();
  });
}


//add department
function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'What is the name of the department you would like to add?'
    },
  ]).then(answers => {
    let newDepartment = { department_name: answers.departmentName }
    db.promise().query('INSERT INTO department SET ?', newDepartment).then(console.log('New department added'));

    openingPrompt();
  })
}

//display role id, title, department, and salary in terminal table
function viewRoles() {
  db.query(`SELECT employee_role.id, employee_role.title, department.department_name, employee_role.salary
  FROM employee_role
  JOIN department ON
  employee_role.department_id = department.id`,
    function (err, results) {
      console.table(results);

      openingPrompt();
    });
}

//add employee role, salary, and department the role belongs to
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
    db.promise().query(`INSERT INTO employee_role SET ?`, roleObj).then(console.log('New role added'));

    openingPrompt();
  })
}

//display employee id, first name, last name, title, department, salary, and manager id in terminal table
function viewEmployees() {
  db.query(`SELECT employee.id, employee.first_name, employee.last_name, employee_role.title, department.department_name, employee_role.salary, employee.manager_id
  FROM employee
  JOIN employee_role ON
  employee.role_id = employee_role.id
  JOIN department ON
  employee_role.department_id = department.id`,
    function (err, results) {
      console.table(results);

      openingPrompt();
    });
}

//add employee with first/last name, role, and manager
async function addEmployee() {
  const [roles] = await db.promise().query('SELECT * FROM employee_role')
  const roleArray = roles.map(({ title, id }) => (
    {
      name: title, value: id

    }
  ))
  const [employees] = await db.promise().query('SELECT * FROM employee')
  const employeeArray = employees.map(({ first_name, last_name, id }) => (
    {
      name: [(first_name), (last_name)], value: id

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
      choices: employeeArray
    },
  ]).then(answers => {
    let employeeObj = { first_name: answers.firstName, last_name: answers.lastName, role_id: answers.existingRoles, manager_id: answers.possibleManager }
    db.promise().query('INSERT INTO employee SET ?', employeeObj).then(console.log('New employee added'));

    openingPrompt();
  })
}

//update role for existing employee
async function updateEmployeeRole() {
  const [employees] = await db.promise().query('SELECT * FROM employee')
  const employeeArray = employees.map(({ first_name, last_name, id }) => (
    {
      name: [(first_name), (last_name)], value: id

    }
  ))
  const [roles] = await db.promise().query('SELECT * FROM employee_role')
  const roleArray = roles.map(({ title, id }) => (
    {
      name: title, value: id
    }
  ))
  inquirer.prompt([
    {
      type: 'list',
      name: 'employeeToUpdate',
      message: "Which employee's role would you like to update?",
      choices: employeeArray
    },
    {
      type: 'list',
      name: 'newRole',
      message: 'Which role would you like to assign the selected employee?',
      choices: roleArray
    },
  ]).then(answers => {
    let roleObj = { title: answers.newRole }
    db.promise().query(`UPDATE employee SET role_id = ${roleObj.title} WHERE id = ${answers.employeeToUpdate}`).then(console.log('Employee role successfully updated'));

    openingPrompt();
  })
}

// quit app
function quit() {
  db.end(function (err) {
    if (err) {
      return console.log('error:' + err.message);
    }
    console.log('Closed connection. See ya Later');
  });
}



openingPrompt()