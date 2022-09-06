const inquirer = require('inquirer');
const fs = require('fs');
const mysql = require('mysql2');
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
        'view all roles',
        'view all employees',
        'add a department',
        'add a role',
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
        case 'view all roles':
          viewRoles();
          break;
        case 'view all employees':
          viewEmployees();
          break;
        case 'add a department':
          addDepartment();
          break;
        case 'add a role':
          addRole();
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


function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'What is the name of the department you would like to add?'
    },
  ]).then(answers => {
    let newDepartment = {department_name: answers.departmentName}
    db.promise().query('INSERT INTO department SET ?', newDepartment).then(dbData => console.log(dbData))
  })
}

async function addRole() {
  const [departments] = await db.promise().query('SELECT * FROM department')
  const departmentArray = departments.map(({id, department_name}) => (
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
    let roleObj = {title: answers.roleName, salary: answers.roleSalary, department_id: answers.existingDepartments}
    db.promise().query('INSERT INTO employee_role SET ?', roleObj).then(dbData => console.log(dbData))
  })
}


openingPrompt()