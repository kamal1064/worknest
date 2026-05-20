import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  partTimeWorkLogSchema,
  PartTimeWorkLogFormValues,
  PartTimeWorker,
} from "@/types/part-time";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { partTimeService } from "@/services/part-time";
import { useQuery } from "@tanstack/react-query";

interface WorkEntryFormProps {
  initialValues?: Partial<PartTimeWorkLogFormValues>;
  onSubmit: (values: PartTimeWorkLogFormValues) => void;
  isLoading?: boolean;
}

export const WorkEntryForm: React.FC<WorkEntryFormProps> = ({
  initialValues,
  onSubmit,
  isLoading,
}) => {
  const [recentClients, setRecentClients] = useState<string[]>([]);

  const { data: workers = [] } = useQuery({
    queryKey: ["part-time-workers"],
    queryFn: () => partTimeService.getWorkers(),
  });

  const form = useForm<PartTimeWorkLogFormValues>({
    resolver: zodResolver(partTimeWorkLogSchema),
    defaultValues: {
      worker_id: initialValues?.worker_id || "",
      client_name: initialValues?.client_name || "",
      working_date: initialValues?.working_date || new Date().toISOString().split("T")[0],
      slab_quantity: initialValues?.slab_quantity || 0,
      slab_price: initialValues?.slab_price || 0,
      delivery_location: initialValues?.delivery_location || "",
      advance_paid: initialValues?.advance_paid || 0,
      notes: initialValues?.notes || "",
    },
  });

  useEffect(() => {
    form.reset({
      worker_id: initialValues?.worker_id || "",
      client_name: initialValues?.client_name || "",
      working_date: initialValues?.working_date || new Date().toISOString().split("T")[0],
      slab_quantity: initialValues?.slab_quantity || 0,
      slab_price: initialValues?.slab_price || 0,
      delivery_location: initialValues?.delivery_location || "",
      advance_paid: initialValues?.advance_paid || 0,
      notes: initialValues?.notes || "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  const { watch, setValue } = form;
  const quantity = watch("slab_quantity");
  const price = watch("slab_price");
  const advance = watch("advance_paid");

  const totalPrice = (quantity || 0) * (price || 0);
  const remainingBalance = totalPrice - (advance || 0);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clients = await partTimeService.getRecentClients();
        setRecentClients(clients);
      } catch (err) {
        console.error("Failed to fetch recent clients", err);
      }
    };
    fetchClients();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="worker_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Worker
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/80 border-gray-200 focus:ring-tech-blue">
                      <SelectValue placeholder="Choose worker" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {workers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Client Name
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder="ABC Constructions"
                      {...field}
                      className="bg-white/80 border-gray-200 focus:ring-tech-blue"
                      list="client-suggestions"
                    />
                  </FormControl>
                  <datalist id="client-suggestions">
                    {recentClients.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="working_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Working Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="bg-white/80 border-gray-200 focus:ring-tech-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delivery_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Delivery Location
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Location"
                    {...field}
                    value={field.value || ""}
                    className="bg-white/80 border-gray-200 focus:ring-tech-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slab_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Slab Quantity
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    {...field}
                    className="bg-white/80 border-gray-200 focus:ring-tech-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slab_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Per Slab Price
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    className="bg-white/80 border-gray-200 focus:ring-tech-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="advance_paid"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Advance Paid
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    className="bg-white/80 border-gray-200 focus:ring-tech-blue"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Price
            </label>
            <Input
              readOnly
              value={`₹${totalPrice.toLocaleString()}`}
              className="bg-gray-50 border-gray-200 font-bold text-dark-slate"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Remaining Balance
            </label>
            <Input
              readOnly
              value={`₹${remainingBalance.toLocaleString()}`}
              className="bg-gray-50 border-gray-200 font-bold text-dark-slate"
            />
          </div>
        </div>

        {recentClients.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Recent Clients:
            </span>
            {recentClients.slice(0, 5).map((client) => (
              <button
                key={client}
                type="button"
                onClick={() => setValue("client_name", client)}
                className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:border-deep-blue hover:text-deep-blue transition-all font-medium shadow-sm"
              >
                {client}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-start gap-4 pt-4 border-t border-gray-100">
          <Button
            type="submit"
            className="bg-deep-blue hover:bg-deep-blue/90 text-white px-8 h-11 shadow-lg shadow-blue-200"
            disabled={isLoading}
          >
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <PlusCircle className="w-4 h-4 mr-2" /> Save Entry
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
