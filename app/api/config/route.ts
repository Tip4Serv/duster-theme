import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  return NextResponse.json({
    handleCustomerIdentification: config.features.handleCustomerIdentification,
  });
}
