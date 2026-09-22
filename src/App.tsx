import React from 'react';
import { useLocation } from 'react-router';
import {
	About,
	CookiePolicy,
	ExhibitionJournal,
	Exhibitions,
	Gallery,
	LegalNotice,
	NotFound,
	Shop,
	ShopContact,
	ShopJournal,
	Welcome,
	WorkJournal,
} from './components';
import { resolveRoute } from './routes';
import { PageEditor, PieceEditor } from './editor';

export default function App() {
	const { pathname } = useLocation();
	const route = resolveRoute(pathname);
	switch (route.kind) {
		case 'pieceEditor':
			return <PieceEditor locale={route.locale} work={route.work} />;
		case 'pageEditor':
			return <PageEditor locale={route.locale} page={route.page} />;
		case 'home':
			return <Welcome locale={route.locale} />;
		case 'gallery':
			return <Gallery locale={route.locale} />;
		case 'work':
			return <WorkJournal locale={route.locale} work={route.work} />;
		case 'exhibitions':
			return <Exhibitions locale={route.locale} />;
		case 'exhibition':
			return <ExhibitionJournal locale={route.locale} exhibition={route.exhibition} />;
		case 'shop':
			return <Shop locale={route.locale} />;
		case 'shopWork':
			return <ShopJournal locale={route.locale} work={route.work} />;
		case 'order':
			return <ShopContact locale={route.locale} />;
		case 'about':
			return <About locale={route.locale} />;
		case 'legal':
			return <LegalNotice locale={route.locale} />;
		case 'cookies':
			return <CookiePolicy locale={route.locale} />;
		default:
			return <NotFound locale={route.locale} />;
	}
}
