'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import FamilyTree from '@/components/FamilyTree';
import {
  HomeView, NewsView, ContactsView, EventsView,
  BookView, MembersView, LibraryView,
} from '@/components/ModuleViews';

const MODULE_MAP = {
  'home':        <HomeView />,
  'news':        <NewsView />,
  'contacts':    <ContactsView />,
  'events':      <EventsView />,
  'family-tree': <FamilyTree />,
  'book':        <BookView />,
  'members':     <MembersView />,
  'library':     <LibraryView />,
};

export default function Page() {
  const [active, setActive] = useState('family-tree');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={active} onSelect={setActive} />
      <main className="flex-1 overflow-hidden">
        {MODULE_MAP[active] ?? MODULE_MAP['family-tree']}
      </main>
    </div>
  );
}
