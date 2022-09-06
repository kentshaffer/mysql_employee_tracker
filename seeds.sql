USE employee_db;
INSERT INTO department(department_name) VALUES ('Admin'), ('Sales'), ('Legal'), ('Service');
INSERT INTO employee_role(title, salary, department_id) VALUES ('Administrator', 120000, 1), ('Salesperson', 80000, 2), ('Lawyer', 100000, 3), ('Tech', 65000, 4);
INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ('Kent', 'Shaffer', 1, NULL), ('Evan', 'Smith', 2, 1), ('Claire', 'Jackson', 3, 1), ('Greg', 'Herron', 4, 1);
