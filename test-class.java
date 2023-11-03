public class CustomerModel {
  private String customerId;
  private String organizationId;
  private CustomerType customerType;
  private String firstName;
  private String lastName;
  private String email;
  private Long version;
  private Boolean requiresValidation = false;
  private List<AddressModel> addresses = new ArrayList<AddressModel>();
  private List<String> phoneNumbers = new ArrayList<String>();

  public String getDisplayName() {
    return this.firstName + " " + this.lastName;
  }
}