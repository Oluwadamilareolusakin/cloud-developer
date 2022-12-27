import { apiEndpoint } from '../config'
import { Todo } from '../types/Todo'
import { CreateTodoRequest } from '../types/CreateTodoRequest'
import Axios from 'axios'
import { UpdateTodoRequest } from '../types/UpdateTodoRequest'

export async function getTodos(idToken: string): Promise<Todo[]> {
  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  return response.data.todos.objects
}

export async function createTodo(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Todo> {
  const response = await Axios.post(
    `${apiEndpoint}/todos`,
    JSON.stringify(newTodo),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.todo
}

export async function patchTodo(
  idToken: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest,
  timestamp: string
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/todos/${todoId}?timestamp=${timestamp}`,
    JSON.stringify(updatedTodo),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
}

export async function deleteTodo(
  idToken: string,
  todoId: string,
  timestamp: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}?timestamp=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string,
  file: Buffer
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/todos/${todoId}/attachment`,
    {
      filetype: file.type,
      filename: file.name
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.uploadUrl
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } })
}
