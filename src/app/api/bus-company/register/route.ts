import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      phone,
      address,
      licenseNumber,
      description,
      contactPersonName,
      contactPersonPhone,
      password,
    } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !address || !licenseNumber || !contactPersonName || !contactPersonPhone || !password) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: 'A company with this email already exists' },
        { status: 409 }
      );
    }

    // Check if license number already exists
    const existingLicense = await prisma.company.findUnique({
      where: { licenseNumber },
    });

    if (existingLicense) {
      return NextResponse.json(
        { error: 'A company with this license number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the company
    const company = await prisma.company.create({
      data: {
        name,
        email,
        phone,
        address,
        licenseNumber,
        description: description || null,
        contactPersonName,
        contactPersonPhone,
        password: hashedPassword,
        status: 'PENDING', // Company needs admin approval
      },
    });

    // Create a user account for the company
    await prisma.user.create({
      data: {
        email: email,
        name: contactPersonName,
        phone: contactPersonPhone,
        password: hashedPassword,
        role: 'COMPANY_OWNER',
      },
    });

    return NextResponse.json({
      message: 'Company registration submitted successfully. Please wait for admin approval.',
      companyId: company.id,
    });
  } catch (error) {
    console.error('Error registering company:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
