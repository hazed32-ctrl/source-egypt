-- Create triggers for notification functions
CREATE TRIGGER on_lead_created
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_lead_created();

CREATE TRIGGER on_lead_assigned
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_lead_assigned();

CREATE TRIGGER on_document_added
  AFTER INSERT ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_document_added();

CREATE TRIGGER on_resale_request_created
  AFTER INSERT ON public.resale_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_resale_request();

CREATE TRIGGER on_property_status_changed
  AFTER UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_property_status_changed();
