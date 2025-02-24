'use server';

import argon2 from 'argon2';
import * as v from 'valibot';
import { SignupSchema } from '@/validators/signup-validator';

type Res =
  | { success: true; userId: string }
  | { success: false; error: v.FlatErrors<undefined>; statusCode: 400 }
  | { success: false; error: string; statusCode: 409 | 500 };

export async function signupUserAction(values: unknown): Promise<Res> {
  const parsedValues = v.safeParse(SignupSchema, values);

  if (!parsedValues.success) {
    const flatErrors = v.flatten(parsedValues.issues);
    return { success: false, error: flatErrors, statusCode: 400 };
  }

  const { name, email, password } = parsedValues.output;

  try {
    console.log('Name: ' + name, 'Email: ' + email, 'Password: ' + password);
    // TODO: Hash password
    const hashedPassword = await argon2.hash(password);
    return { success: true, userId: 'userId' };
  } catch (err) {
    console.log(err);
    return { success: false, error: 'Internal server error', statusCode: 500 };
  }
}
