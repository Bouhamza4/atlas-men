// app/api/contact/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// تهيئة Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { name, email, subject, message } = body;

    // التحقق من البيانات
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // إدخال البيانات في Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name,
          email,
          subject,
          message,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save contact message' },
        { status: 500 }
      );
    }

    // إرسال رسالة تأكيد بالبريد الإلكتروني (اختياري)
    // يمكنك إضافة إرسال بريد إلكتروني هنا

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact message saved successfully',
        data 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}