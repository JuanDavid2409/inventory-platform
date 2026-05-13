import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;

    return NextResponse.next();
}