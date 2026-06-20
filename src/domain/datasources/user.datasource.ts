export abstract class UserDatasource {
  abstract create(createTodoDto: CreateUserDto): Promise<TodoEntity>;

  //todo: paginación
  abstract getAll(): Promise<UserEntity[]>;

  abstract findById(id: number): Promise<UserEntity>;
  abstract updateById(updateTodoDto: UpdateUserDto): Promise<TodoEntity>;
  abstract deleteById(id: number): Promise<UserEntity>;
}
