import React from "react";
import { Controller } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedMessage, useIntl } from "react-intl";

type Props = {
  form: any;
  index: number;
  valueType: string;
};

const CustomParams: React.FC<Props> = ({ form, index, valueType }) => {
  const intl = useIntl();
  return (
    <div>
      <Controller
        name={`params.${index}.name`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <FormattedMessage id="components.CustomParams.paramName" />
            </FormLabel>
            <FormControl>
              <Input
                type="string"
                placeholder={intl.formatMessage({
                  id: "components.CustomParams.paramName.placeholder",
                })}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Controller
        name={`params.${index}.path`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <FormattedMessage id="components.CustomParams.paramPath" />
            </FormLabel>
            <FormControl>
              <Input
                type="string"
                placeholder={intl.formatMessage({
                  id: "components.CustomParams.paramPath.placeholder",
                })}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Controller
        name={`params.${index}.description`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <FormattedMessage id="components.CustomParams.paramDescription" />
            </FormLabel>
            <FormControl>
              <Input
                type="string"
                placeholder={intl.formatMessage({
                  id: "components.CustomParams.paramDescription.placeholder",
                })}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Controller
        name={`params.${index}.required`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <FormattedMessage id="components.CustomParams.isRequired" />
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={intl.formatMessage({
                      id: "components.CustomParams.isRequired.placeholder",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <FormattedMessage id="components.CustomParams.true" />
                  </SelectItem>
                  <SelectItem value="false">
                    <FormattedMessage id="components.CustomParams.false" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Controller
        name={`params.${index}.valueType`}
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <FormattedMessage id="components.CustomParams.paramType" />
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={intl.formatMessage({
                      id: "components.CustomParams.paramType.placeholder",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">
                    <FormattedMessage id="components.CustomParams.string" />
                  </SelectItem>
                  <SelectItem value="upload">
                    <FormattedMessage id="components.CustomParams.upload" />
                  </SelectItem>
                  <SelectItem value="interger">
                    <FormattedMessage id="components.CustomParams.interger" />
                  </SelectItem>
                  <SelectItem value="float">
                    <FormattedMessage id="components.CustomParams.float" />
                  </SelectItem>
                  <SelectItem value="seed">
                    <FormattedMessage id="components.CustomParams.seed" />
                  </SelectItem>
                  <SelectItem value="boolean">
                    <FormattedMessage id="components.CustomParams.boolean" />
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {(valueType === "interger" ||
        valueType === "float" ||
        valueType === "seed") && (
        <>
          <Controller
            name={`params.${index}.min`}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="components.CustomParams.min" />
                </FormLabel>
                <FormControl>
                  <Input type="number" defaultValue={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
            name={`params.${index}.max`}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="components.CustomParams.max" />
                </FormLabel>
                <FormControl>
                  <Input type="number" defaultValue={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Controller
            name={`params.${index}.step`}
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FormattedMessage id="components.CustomParams.step" />
                </FormLabel>
                <FormControl>
                  <Input type="number" defaultValue={0.1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};

export default CustomParams;
