import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, User, Mail, Phone, Tag, Trash2, Edit2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    Contact,
    ContactPayload
} from "@/lib/api";

const ContactsManagement = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const [form, setForm] = useState<ContactPayload>({
        name: "",
        phone: "",
        email: "",
        tags: [],
        notes: ""
    });

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ["contacts"],
        queryFn: fetchContacts,
    });

    const createMut = useMutation({
        mutationFn: createContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
            setDialogOpen(false);
            toast.success("Contact created successfully");
        },
        onError: () => toast.error("Failed to create contact"),
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<ContactPayload> }) =>
            updateContact(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
            setDialogOpen(false);
            toast.success("Contact updated successfully");
        },
        onError: () => toast.error("Failed to update contact"),
    });

    const deleteMut = useMutation({
        mutationFn: deleteContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contacts"] });
            toast.success("Contact deleted");
        },
        onError: () => toast.error("Failed to delete contact"),
    });

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openNewDialog = () => {
        setIsEdit(false);
        setForm({ name: "", phone: "", email: "", tags: [], notes: "" });
        setDialogOpen(true);
    };

    const openEditDialog = (contact: Contact) => {
        setIsEdit(true);
        setSelectedContact(contact);
        setForm({
            name: contact.name,
            phone: contact.phone,
            email: contact.email || "",
            tags: contact.tags || [],
            notes: contact.notes || ""
        });
        setDialogOpen(true);
    };

    const handleSave = () => {
        if (isEdit && selectedContact) {
            updateMut.mutate({ id: selectedContact.id, payload: form });
        } else {
            createMut.mutate(form);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Contact Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your customer database and WhatsApp contacts
                    </p>
                </div>
                <Button variant="hero" onClick={openNewDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, phone or email..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
                    ))
                ) : filteredContacts.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No contacts found.
                    </div>
                ) : filteredContacts.map((contact, index) => (
                    <motion.div
                        key={contact.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 bg-card rounded-xl border border-border shadow-card group hover:border-primary/50 transition-colors"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(contact)}>
                                    <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMut.mutate(contact.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        <h3 className="font-semibold text-lg truncate mb-1">{contact.name}</h3>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{contact.phone}</span>
                            </div>
                            {contact.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="truncate">{contact.email}</span>
                                </div>
                            )}
                        </div>

                        {contact.tags && contact.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {contact.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                        <Tag className="w-2.5 h-2.5 mr-1" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number (with country code)</Label>
                            <Input
                                id="phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+1234567890"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma separated)</Label>
                            <Input
                                id="tags"
                                value={form.tags?.join(", ")}
                                onChange={(e) => setForm({
                                    ...form,
                                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                                })}
                                placeholder="VIP, Shopify, Customer"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="hero"
                            onClick={handleSave}
                            disabled={createMut.isPending || updateMut.isPending}
                        >
                            {isEdit ? "Update Contact" : "Save Contact"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ContactsManagement;
