import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const APP_NAME = "Offline First Todo";
const APP_DEFAULT_TITLE = "Offline First Todo | Works without internet";
const APP_TITLE_TEMPLATE = "%s | Offline First Todo";
const APP_DESCRIPTION =
	"Offline-capable task manager for teams in low-connectivity environments. Caches the UI, server data, and requests so work continues without internet.";

export const metadata: Metadata = {
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	keywords: [
		"offline first",
		"todo app",
		"pwa",
		"task manager",
		"tanstack query",
		"serwist",
	],
	category: "productivity",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: APP_DEFAULT_TITLE,
		// startUpImage: [],
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	twitter: {
		card: "summary",
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f7f5f2" },
		{ media: "(prefers-color-scheme: dark)", color: "#1f1a18" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" dir="ltr" suppressHydrationWarning>
			<head>
				<Script
					defer
					src="https://umami.nomomon.xyz/script.js"
					data-website-id="04e3d459-c450-4657-bbb2-3a62ed7c362b"
					strategy="afterInteractive"
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider>
					<AuthProvider>
						<QueryProvider>
							{children}
							<Toaster />
						</QueryProvider>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
