import type { Metadata } from "next";
import { fetchNoteById } from "@/lib/api";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import NoteDetailsClient from "./NoteDetails.client";

interface NoteDetailsPageProps {
  params: Promise<{ id: string }>;
}


export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params;

  try {
    const note = await fetchNoteById(id);

    const title = note?.title
      ? `${note.title} — Note`
      : "Note details";
    const description =
      note?.excerpt ||
      (note?.content
        ? `${String(note.content).slice(0, 150).replace(/\n/g, " ")}...`
        : "View details of the note.");

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
      
    };
  } catch (err) {
    
    return {
      title: "Note — Not found",
      description: "The requested note could not be loaded.",
      openGraph: {
        title: "Note — Not found",
        description: "The requested note could not be loaded.",
      },
    };
  }
}

export default async function NoteDetailsPage({
  params,
}: NoteDetailsPageProps) {
  const queryClient = new QueryClient();
  const { id } = await params;

  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
